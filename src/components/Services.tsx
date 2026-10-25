import { useState } from "react";
import {
  Map,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function Services() {
  const [active, setActive] = useState(null);

  const services = [
    {
      id: 3,
      title: "Tour Packages",
      icon: <Map size={35} />,
      short: "Explore amazing destinations.",
      details:
        "Discover customized tour packages with sightseeing, transportation, hotels, meals, and local guides included for a memorable travel experience.",
    },
    {
      id: 4,
      title: "Travel Insurance",
      icon: <Shield size={35} />,
      short: "Travel without worries.",
      details:
        "Protect your trip with travel insurance covering medical emergencies, trip cancellations, baggage loss, and other unexpected situations.",
    },
  ];

  const toggleCard = (id) => {
    setActive(active === id ? null : id);
  };

  return (
    <section className="py-16 bg-gray-100">
      <h2 className="text-4xl font-bold text-center mb-3">
        Our Services
      </h2>

      <p className="text-center text-gray-500 mb-10">
        Everything you need for the perfect trip.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 px-10">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl"
            onClick={() => toggleCard(service.id)}
          >
            <div className="flex justify-center text-orange-500">
              {service.icon}
            </div>

            <h3 className="text-xl font-semibold text-center mt-4">
              {service.title}
            </h3>

            <p className="text-gray-500 text-center mt-2">
              {service.short}
            </p>

            <div className="flex justify-center mt-3">
              {active === service.id ? (
                <ChevronUp />
              ) : (
                <ChevronDown />
              )}
            </div>

            {active === service.id && (
              <div className="mt-5 border-t pt-4">
                <p className="text-gray-700">
                  {service.details}
                </p>

                <button className="mt-5 w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600">
                  Learn More
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}