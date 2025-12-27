export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16 flex justify-center">
      <section className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
          Contact Us
        </h1>
        <p className="text-gray-600 mb-8">
          Have a question, feedback, or need help with an order? Reach out using
          the info below.
        </p>

        <div className="space-y-6 text-gray-800">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-1">
              Email
            </h2>
            <a
              href="mailto:support@example.com"
              className="text-base text-blue-600 hover:text-blue-700 underline underline-offset-4"
            >
              support@tbibeljou3.dz
            </a>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-1">
              Phone
            </h2>
            <p className="text-base">+1 (555) 123-4567</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-1">
              Address
            </h2>
            <p className="text-base">
              blassa fi alger
              <br />
              dzayer, algerie
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
