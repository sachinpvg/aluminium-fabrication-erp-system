import React, { useEffect, useRef, useState } from "react";
import "./countersection.css";

function Counter({ target, label, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;

          let start = 0;
          const duration = 2000;
          const increment = target / (duration / 16);

          const updateCounter = () => {
            start += increment;
            if (start < target) {
              setCount(Math.floor(start));
              requestAnimationFrame(updateCounter);
            } else {
              setCount(target);
            }
          };

          updateCounter();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
  }, [target]);

  return (
    <div ref={ref} className="counter-box text-center">
      <h1 className="counter-number">
        {count}
        {suffix}
      </h1>
      <p className="counter-label">{label}</p>
    </div>
  );
}

export default function CounterSection() {
  return (
    <div className="container-fluid counter-section">
      <div className="row text-center">

        <div className="col-12 col-md-4">
          <Counter target={15} suffix="+" label="Years Experience" />
        </div>

        <div className="col-12 col-md-4">
          <Counter target={500} suffix="+" label="Projects Completed" />
        </div>

        <div className="col-12 col-md-4">
          <Counter target={100} suffix="%" label="Client Satisfaction" />
        </div>

      </div>
    </div>
  );
}