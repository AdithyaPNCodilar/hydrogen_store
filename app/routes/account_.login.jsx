import {json, redirect} from '@shopify/remix-oxygen';
import {Form, Link, useActionData} from '@remix-run/react';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Login'}];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  if (await context.session.get('customerAccessToken')) {
    return redirect('/account');
  }
  return json({});
}

/**
 * @param {ActionFunctionArgs}
 */
export async function action({request, context}) {
  const {session, storefront} = context;

  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  try {
    const form = await request.formData();
    const email = String(form.has('email') ? form.get('email') : '');
    const password = String(form.has('password') ? form.get('password') : '');
    const validInputs = Boolean(email && password);

    if (!validInputs) {
      throw new Error('Please provide both an email and a password.');
    }

    const {customerAccessTokenCreate} = await storefront.mutate(
      LOGIN_MUTATION,
      {
        variables: {
          input: {email, password},
        },
      },
    );

    if (!customerAccessTokenCreate?.customerAccessToken?.accessToken) {
      throw new Error(customerAccessTokenCreate?.customerUserErrors[0].message);
    }

    const {customerAccessToken} = customerAccessTokenCreate;
    session.set('customerAccessToken', customerAccessToken);

    return redirect('/account');
  } catch (error) {
    if (error instanceof Error) {
      return json({error: error.message}, {status: 400});
    }
    return json({error}, {status: 400});
  }
}

export default function Login() {
  /** @type {ActionReturnData} */
  const data = useActionData();
  const error = data?.error || null;

  return (
    <div className="login bg-[var(--theme-lightGray-color)] min-h-screen flex items-center justify-center">
  <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
    <h1 className="text-3xl font-extrabold text-center text-[var(--theme-primary-color)] mb-6">
      Sign in
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
        Sign in
      </button>
    </Form>
    <div className="mt-6 text-sm text-center text-gray-600">
      <p>
        <Link
          to="/account/recover"
          className="text-[var(--theme-primary-color)] hover:underline"
        >
          Forgot password →
        </Link>
      </p>
      <p className="mt-2">
        <Link
          to="/account/register"
          className="text-[var(--theme-primary-color)] hover:underline"
        >
          Register →
        </Link>
      </p>
    </div>
  </div>
</div>

  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customeraccesstokencreate
const LOGIN_MUTATION = `#graphql
  mutation login($input: CustomerAccessTokenCreateInput!) {
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
 * }} ActionResponse
 */

/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
