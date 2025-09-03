// components/CTASection.tsx
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/button";

export default function CTASection() {
  return (
    <motion.section
      className="py-20 bg-gradient-to-r from-cesizen-600 to-cesizen-700 text-white"
      initial={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, amount: 0.3 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="container mx-auto px-6 text-center space-y-6">
        <h2 className="text-4xl font-bold">
          Prêt à commencer votre voyage vers le bien-être ?
        </h2>
        <p className="text-xl opacity-90">
          Rejoignez des milliers d'utilisateurs qui ont déjà transformé leur vie
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div
            transition={{ type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.05 }}
          >
            <Button
              className="bg-white text-cesizen-600 hover:bg-gray-100 text-lg px-8 py-6"
              size="lg"
              startContent={<span className="text-lg">👥</span>}
              variant="shadow"
              as="a"
              href="/register"
            >
              Inscription gratuite
            </Button>
          </motion.div>
          <motion.div
            transition={{ type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.05 }}
          >
            <Button
              className="border-white text-white hover:bg-white hover:text-cesizen-600 text-lg px-8 py-6"
              size="lg"
              variant="bordered"
              as="a"
              href="/articles"
            >
              En savoir plus
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}