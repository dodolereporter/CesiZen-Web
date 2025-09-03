// components/FeaturesSection.tsx
import React from "react";
import { motion } from "framer-motion";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Brain, Heart, Zap } from "lucide-react";
import { Button } from "@heroui/button";

const features = [
  {
    icon: <Brain className="w-8 h-8 text-cesizen-600" />,
    title: "Questionnaire",
    description: "Évaluez votre stress en seulement 5 minutes.",
    color: "from-cesizen-100 to-cesizen-50",
  },
  {
    icon: <Heart className="w-8 h-8 text-cesizen-700" />,
    title: "Cohérence Cardiaque",
    description: "Réduisez instantanément votre stress par la respiration.",
    color: "from-cesizen-200 to-cesizen-100",
  },
  {
    icon: <Zap className="w-8 h-8 text-cesizen-800" />,
    title: "Coaching IA",
    description: "Des conseils sur-mesure adaptés à vos besoins.",
    color: "from-cesizen-300 to-cesizen-200",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      {/* En-tête */}
      <div className="container mx-auto px-6 text-center mb-12">
        <motion.h2
          className="text-3xl font-semibold"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          Nos 3 piliers
        </motion.h2>
        <motion.p
          className="text-gray-600 mt-2"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
          whileInView={{ opacity: 1 }}
        >
          Les fonctionnalités clés pour votre bien-être
        </motion.p>
      </div>

      {/* Cartes */}
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              viewport={{ once: true, amount: 0.3 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 hover:shadow-lg transition">
                <CardHeader className="flex justify-center mb-4">
                  <div
                    className={`p-3 rounded-full bg-gradient-to-r ${f.color}`}
                  >
                    {f.icon}
                  </div>
                </CardHeader>
                <CardBody className="text-center">
                  <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                  <p className="text-gray-600 mb-4">{f.description}</p>
                  <Button
                    className="bg-gradient-to-r from-cesizen-500 to-cesizen-600 text-white"
                    size="sm"
                    variant="solid"
                  >
                    Découvrir
                  </Button>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}