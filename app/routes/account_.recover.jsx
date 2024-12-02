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
  const {storefront} = context;
  const form = await request.formData();
  const email = form.has('email') ? String(form.get('email')) : null;

  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  try {
    if (!email) {
      throw new Error('Please provide an email.');
    }
    await storefront.mutate(CUSTOMER_RECOVER_MUTATION, {
      variables: {email},
    });

    return json({resetRequested: true});
  } catch (error) {
    const resetRequested = false;
    if (error instanceof Error) {
      return json({error: error.message, resetRequested}, {status: 400});
    }
    return json({error, resetRequested}, {status: 400});
  }
}

export default function Recover() {
  /** @type {ActionReturnData} */
  const action = useActionData();

  return (
    <div className="account-recover bg-[var(--theme-lightGray-color)] min-h-screen flex items-center justify-center">
  <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
    {action?.resetRequested ? (
      <>
        <h1 className="text-3xl font-extrabold text-[var(--theme-primary-color)] mb-4">
          Request Sent
        </h1>
        <p className="text-gray-600 mb-6">
          If that email address is in our system, you will receive an email with
          instructions on how to reset your password in a few minutes.
        </p>
        <Link
          to="/account/login"
          className="inline-block bg-[var(--theme-primary-color)] text-white py-2 px-4 rounded-md font-semibold hover:bg-[var(--theme-darkPrimary-color)] focus:ring-2 focus:ring-[var(--theme-primary-color)] focus:ring-opacity-50"
        >
          Return to Login
        </Link>
      </>
    ) : (
      <>
        <h1 className="text-3xl font-extrabold text-[var(--theme-primary-color)] mb-4">
          Forgot Password
        </h1>
        <p className="text-gray-600 mb-6">
          Enter the email address associated with your account to receive a link
          to reset your password.
        </p>
        <Form method="POST" className="space-y-6">
          <fieldset className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                aria-label="Email address"
                autoComplete="email"
                autoFocus
                id="email"
                name="email"
                placeholder="Enter your email address"
                required
                type="email"
                className="mt-1 block w-full px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-[var(--theme-primary-color)] focus:border-[var(--theme-primary-color)]"
              />
            </div>
          </fieldset>
          {action?.error && (
            <p className="text-sm text-red-600 mt-2">
              <mark className="bg-red-100">{action.error}</mark>
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-[var(--theme-purple-color)] text-white py-2 px-4 rounded-md font-semibold hover:bg-[var(--theme-lightPurple-color)] focus:ring-2 focus:ring-[var(--theme-lightPurple-color)] focus:ring-opacity-50"
          >
            Request Reset Link
          </button>
        </Form>
        <div className="mt-6 text-sm">
          <Link
            to="/account/login"
            className="text-[var(--theme-primary-color)] hover:underline"
          >
            Login →
          </Link>
        </div>
      </>
    )}
  </div>
</div>

  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customerrecover
const CUSTOMER_RECOVER_MUTATION = `#graphql
  mutation customerRecover(
    $email: String!,
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

/**
 * @typedef {{
 *   error?: string;
 *   resetRequested?: boolean;
 * }} ActionResponse
 */

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
