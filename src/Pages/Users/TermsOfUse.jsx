import React from 'react'
import img from "../../assets/57.png"

function TermsOfUse() {
  return (
    <div>
         <div className="min-h-screen bg-slate-50">
     
      <header className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-10 shadow-lg h-56"  style={{ backgroundImage: `url(${img})` }}>
        <div className="mx-auto px-6">
          <h1 className="text-3xl text-black font-extrabold tracking-wide">
            Terms of Use
          </h1>
          <p className="text-sm mt-2 text-black">
            Effective Date: <strong>29-09-2025</strong>
          </p>
        </div>
      </header>
      <main className=" mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 space-y-8 leading-relaxed text-slate-700">

    
          <p className="bg-amber-50 text-amber-900 border border-amber-200 rounded-lg p-4 text-sm">
            By accessing or using the Capenaturals Platform, you agree to these Terms of Use.
            If you do not agree, you may discontinue using our service.
          </p>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">
              1. Who We Are
            </h2>
            <p>
              Capenaturals (“we”, “our”, “us”) is an online shopping platform that allows you
              to browse and order honey, spices, native specials, oils, and nuts.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">
              2. Eligibility
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must be 18 years or older to place orders.</li>
              <li>If under 18, a parent or guardian must supervise.</li>
              <li>You confirm you have the right and capacity to enter into this agreement.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">
              3. Your Account
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You agree to provide accurate information during registration.</li>
              <li>You are responsible for your login details and activity in your account.</li>
              <li>Notify us immediately if you suspect unauthorized access.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">
              4. Orders, Payments & Delivery
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Orders depend on product availability.</li>
              <li>Prices may change at any time based on market conditions.</li>
              <li>Payments are processed securely by third-party providers.</li>
              <li>Delivery timelines are estimates and may vary due to external factors.</li>
              <li>Incorrect delivery details may cause cancellations or extra charges.</li>
            </ul>
          </section>

 
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">
              5. Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Engage in unlawful or fraudulent activities.</li>
              <li>Disrupt or hack the Platform systems.</li>
              <li>Manipulate offers, payments, or order systems.</li>
              <li>Copy or reverse-engineer Platform code or content.</li>
            </ul>
          </section>

  
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">
              6. Content & Intellectual Property
            </h2>
            <p>
              All brand names, images, and content on Capenaturals are protected.
              You may not reuse them without permission.
            </p>
          </section>
    <section className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">
              7. Privacy
            </h2>
            <p>
              Your information is used only as described in our{" "}
              <a
                href="https://www.astracape.com/privacy-policy.html"
                target="_blank"
                rel="noreferrer"
                className="text-amber-700 underline font-medium"
              >
                Privacy Policy
              </a>.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">
              8. Limitation of Liability
            </h2>
            <p>
              We provide the Platform on an “as is” basis. To the maximum extent permitted by law,
              our total liability will not exceed <span className="font-bold">₹5,000</span>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">
              9. Indemnity
            </h2>
            <p>
              You agree to protect Capenaturals and its team from any claims or losses caused by
              your misuse or violation of these Terms.
            </p>
          </section>

          <section className="text-xs text-slate-500 border-t pt-4">
            By continuing to use our Platform, you agree to updated Terms if revised in the future.
          </section>

        </div>
      </main>
    </div>
    </div>
  )
}

export default TermsOfUse