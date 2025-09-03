// components/TestimonialsSection.tsx
import React from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@heroui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Marie Dubois",
    role: "Étudiante en Master",
    avatar: "https://i.pravatar.cc/100?img=1",
    rating: 5,
    quote:
      "CesiZen m’a aidée à gérer mon stress pendant mes examens. Incontournable !",
  },
  {
    name: "Thomas Martin",
    role: "Développeur Full-Stack",
    avatar: "https://i.pravatar.cc/100?img=2",
    rating: 5,
    quote:
      "Les exercices de respiration sont simples, efficaces et m’ont aidé à mieux dormir.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-gray-50">
      {/* En-tête */}
      <div className="container mx-auto px-6 text-center mb-12">
        <motion.h2
          className="text-3xl font-semibold"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          Ils nous font confiance
        </motion.h2>
        <motion.p
          className="text-gray-600 mt-2"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
          whileInView={{ opacity: 1 }}
        >
          Découvrez les témoignages de nos utilisateurs
        </motion.p>
      </div>

      {/* Cartes */}
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              viewport={{ once: true, amount: 0.3 }}
              whileInView={{ scale: 1, opacity: 1 }}
            >
              <Card className="p-6 hover:shadow-lg transition">
                <CardBody>
                  <img
                    alt={t.name}
                    className="w-16 h-16 rounded-full mx-auto mb-4"
                    src={t.avatar}
                  />
                  <h3 className="text-lg font-bold">{t.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{t.role}</p>
                  <div className="flex justify-center mb-4">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"{t.quote}"</p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}