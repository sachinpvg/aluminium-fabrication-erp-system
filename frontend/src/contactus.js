import React, { useEffect } from "react";
import "./contact.css";
import Nav from './comp/nav'
import Footer from './comp/footer'
import ContactForm from "./comp/ContactForm";
import WorkerApplyForm from "./comp/WorkerApplyForm";

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    "Aluminium Windows",
    "Steel Windows",
    "Office Partition",
    "ACP Cladding",
    "Glass Work",
    "Mosquito Mesh",
  ];

  const gallery = ["w1.jpg", "w2.jpg", "w3.jpg", "w4.jpg", "w5.jpg", "w6.jpg"];

  return (
    <>

      <Nav></Nav>

      <div className="contact-page">


        <section className="contact-hero">
          <h1 className="contact-hero-title"> Let’s Build Your Next Aluminium Project</h1>
          <p className="contact-hero-sub"> Contact us for windows, doors, partitions and custom fabrication</p>
          <button className="btn btn-warning contact-hero-btn"> Get Quote </button>
        </section>


        <section className="container mt-5">
          <div className="row text-center">
            <div className="col-md-4">
              <div className="contact-card">
                <h5>Call Us</h5>
                <p>+91 9790169958</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="contact-card">
                <h5>Email Us</h5>
                <p>sales@vectorindustries.com</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="contact-card">
                <h5>Visit Workshop</h5>
                <p>Madurai, Tamil Nadu</p>
              </div>
            </div>
          </div>
        </section>


        <section className="container mt-5">
          <div className="row align-items-center">
            <div className="col-md-6 contact-img-zoom">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRkRiIU2H7j2ESnfCg5x4X2cF2epMX5A4KAg&s" alt="installation" className="img-fluid rounded" />
            </div>

            <div className="col-md-6 contact-fade-up">
              <h3>Why Contact Us?</h3>
              <ul>
                <li>Free site visit and measurement</li>
                <li>Accurate fabrication</li>
                <li>On-time delivery</li>
                <li>Best price quotation</li>
              </ul>
            </div>
          </div>
        </section>


        <section className="container mt-5 text-center">
          <h3>Our Services</h3>
          <div className="row mt-4">
            {services.map((item, i) => (
              <div className="col-md-4 mb-3" key={i}>
                <div className="contact-service-card">{item}</div>
              </div>
            ))}
          </div>
        </section>



        <ContactForm />

        {/* Become a Worker Section */}
        <WorkerApplyForm />


        <section className="container mt-5">
          <div className="row">
            <div className="col-md-6">
              <iframe title="map" src="https://www.google.com/maps" width="100%" height="300" className="rounded"></iframe>
            </div>

            <div className="col-md-6 contact-fade-up">
              <h5>Office Address</h5>
              <p>Vector Industries, Madurai</p>
              <h6>Working Hours</h6>
              <p>Mon–Sat: 9 AM – 7 PM</p>
            </div>
          </div>
        </section>

        <section className="contact-cta">
          <h4>Need a quotation today?</h4>
          <button className="btn btn-dark contact-cta-btn">Request Quote</button>
        </section>
      </div>
      <Footer></Footer>
    </>
  );
}

