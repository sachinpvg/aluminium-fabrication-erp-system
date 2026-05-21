import React from "react";
import "./aboutas.css";
import Nav from './comp/nav'
import Footer from './comp/footer'
import CounterSection from './comp/CounterSection'


export default function Aboutas() {
  return (
    <>
    <Nav></Nav>
    <div className="about-page">

      
      <div className="container-fluid about-hero">
        <div className="row align-items-center">
          <div className="col-12 col-lg-6 text-center text-lg-start">
            <h1 className="fw-bold">About VECTOR INDUSTRIES</h1>
            <p className="lead">
              Precision Aluminium Fabrication & ERP Solutions for Modern Buildings
            </p>
            <p>
              We specialize in designing, manufacturing, and installing
              high-quality aluminium windows, doors, partitions, and custom
              fabrication works with advanced ERP workflow integration.
            </p>
          </div>

          <div className="col-12 col-lg-6 text-center">
            <img src="/images/skech.png"alt="aluminium work"className="img-fluid hero-img"/>
          </div>
        </div>
      </div>

      
      <div className="container mt-5">
        <div className="row">
          <div className="col-12 col-lg-6">
            <h2 className="section-title">Who We Are</h2><p>VECTOR INDUSTRIES is a professionally managed aluminiumfabrication company with 15+ years of experience in deliveringpremium aluminium windows, doors, partitions, and customstructural solutions for residential, commercial, and industrial projects.</p>
            <p>Our team combines skilled workmanship, modern machinery, and ERPautomation to ensure accurate quotations, streamlined production,real-time tracking, and on-time project delivery.</p>
           <div className="pt-3">
           <h3 className="section-title">Our Mission</h3>
            <p> To deliver high-quality aluminium fabrication solutions usinprecision engineering, durable materials, and ERP-driven workflowto improve efficiency and customer satisfaction.</p>
            </div>
            <div className="pt-3">
             <h3 className="section-title">Our Vision</h3>
            <p>To become a leading aluminium fabrication and ERP solution provider in India by offering innovative, reliable, and scalablesystems for modern construction projects.</p>
          </div>

          </div>
<div className="col-12 col-lg-6 text-center">
            <img src="https://cdn-icons-png.flaticon.com/512/4042/4042171.png"alt="installation"className="img-fluid about-img"/>
          </div>
        </div>
      </div>

      


<CounterSection></CounterSection>

    
      <div className="container-fluid cta-section text-center mt-5">
        <h2>Give Your Home a New Look with Premium Aluminium Designs</h2>
        <p>Call Us Now: +91 9790169958</p>
        <button className="btn btn-primary px-4 py-2">Contact Us</button>
      </div>

    </div>
    <Footer></Footer>
    </>
  );
}