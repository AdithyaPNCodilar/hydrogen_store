import {json, redirect} from '@shopify/remix-oxygen';
import {Form, Link, useActionData} from '@remix-run/react';

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  const customerAccessToken = await context.session.get('customerAccessToken');
  if (customerAccessToken) {
    return redirect('/account');
  }

  return json({});
}

/**
 * @param {ActionFunctionArgs}
 */
export async function action({request, context}) {
  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  const {storefront, session} = context;
  const form = await request.formData();
  const email = String(form.has('email') ? form.get('email') : '');
  const password = form.has('password') ? String(form.get('password')) : null;
  const passwordConfirm = form.has('passwordConfirm')
    ? String(form.get('passwordConfirm'))
    : null;

  const validPasswords =
    password && passwordConfirm && password === passwordConfirm;

  const validInputs = Boolean(email && password);
  try {
    if (!validPasswords) {
      throw new Error('Passwords do not match');
    }

    if (!validInputs) {
      throw new Error('Please provide both an email and a password.');
    }

    const {customerCreate} = await storefront.mutate(CUSTOMER_CREATE_MUTATION, {
      variables: {
        input: {email, password},
      },
    });

    if (customerCreate?.customerUserErrors?.length) {
      throw new Error(customerCreate?.customerUserErrors[0].message);
    }

    const newCustomer = customerCreate?.customer;
    if (!newCustomer?.id) {
      throw new Error('Could not create customer');
    }

    // get an access token for the new customer
    const {customerAccessTokenCreate} = await storefront.mutate(
      REGISTER_LOGIN_MUTATION,
      {
        variables: {
          input: {
            email,
            password,
          },
        },
      },
    );

    if (!customerAccessTokenCreate?.customerAccessToken?.accessToken) {
      throw new Error('Missing access token');
    }
    session.set(
      'customerAccessToken',
      customerAccessTokenCreate?.customerAccessToken,
    );

    return json(
      {error: null, newCustomer},
      {
        status: 302,
        headers: {
          Location: '/account',
        },
      },
    );
  } catch (error) {
    if (error instanceof Error) {
      return json({error: error.message}, {status: 400});
    }
    return json({error}, {status: 400});
  }
}

export default function Register() {
  /** @type {ActionReturnData} */
  const data = useActionData();
  const error = data?.error || null;
  return (
    <div className="login bg-[var(--theme-lightGray-color)] min-h-screen flex items-center justify-center">
  <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
    <h1 className="text-3xl font-extrabold text-center text-[var(--theme-primary-color)] mb-6">
      Register
    </h1>
    <Form method="POST" className="space-y-6">
      <fieldset className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Enter your email"
            className="mt-1 block w-full px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-[var(--theme-primary-color)] focus:border-[var(--theme-primary-color)]"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            minLength={8}
            required
            className="mt-1 block w-full px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-[var(--theme-primary-color)] focus:border-[var(--theme-primary-color)]"
          />
        </div>
        <div>
          <label
            htmlFor="passwordConfirm"
            className="block text-sm font-medium text-gray-700"
          >
            Re-enter password
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autoComplete="current-password"
            placeholder="Re-enter your password"
            minLength={8}
            required
            className="mt-1 block w-full px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-[var(--theme-primary-color)] focus:border-[var(--theme-primary-color)]"
          />
        </div>
      </fieldset>
      {error && (
        <p className="text-sm text-red-600 mt-2">
          <mark className="bg-red-100">{error}</mark>
        </p>
      )}
      <button
        type="submit"
        className="w-full bg-[var(--theme-purple-color)] text-white py-2 px-4 rounded-md font-semibold hover:bg-[var(--theme-lightPurple-color)] focus:ring-2 focus:ring-[var(--theme-lightPurple-color)] focus:ring-opacity-50"
      >
        Register
      </button>
    </Form>
    <div className="mt-6 text-sm text-center text-gray-600">
      <p>
        Already have an account?{" "}
        <Link
          to="/account/login"
          className="text-[var(--theme-primary-color)] hover:underline"
        >
          Login →
        </Link>
      </p>
    </div>
  </div>
</div>

  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customerCreate
const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation customerCreate(
    $input: CustomerCreateInput!,
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customeraccesstokencreate
const REGISTER_LOGIN_MUTATION = `#graphql
  mutation registerLogin(
    $input: CustomerAccessTokenCreateInput!,
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customerAccessTokenCreate(input: $input) {
      customerUserErrors {
        code
        field
        message
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
    }
  }
`;

/**
 * @typedef {{
 *   error: string | null;
 *   newCustomer:
 *     | NonNullable<CustomerCreateMutation['customerCreate']>['customer']
 *     | null;
 * }} ActionResponse
 */

/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('storefrontapi.generated').CustomerCreateMutation} CustomerCreateMutation */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
