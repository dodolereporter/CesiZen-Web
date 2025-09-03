// components/HeroSection.tsx
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";

import styles from "./HeroSection.module.css";

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const features = [
    { emoji: "🫁", text: "Exercice de respiration" },
    { emoji: "❤️", text: "Suivi personnalisé" },
    { emoji: "🛡️", text: "100 % sécurisé" },
  ];

  useEffect(() => {
    const iv = setInterval(
      () => setCurrent((i) => (i + 1) % features.length),
      4000,
    );

    return () => clearInterval(iv);
  }, []);

  return (
    <motion.section
      className={`${styles.heroBg} min-h-[80vh] flex items-center justify-center py-20`}
      initial={{ opacity: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      whileInView={{ opacity: 1 }}
    >
      {/* Formes animées en arrière-plan */}
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} className={`${styles.shape} ${styles["shape" + n]}`} />
      ))}

      <div className="relative z-10 text-center p-6 space-y-6">


        {/* Titre principal */}
        <motion.h1
          className="text-6xl font-bold bg-gradient-to-r from-cesizen-600 to-cesizen-700 bg-clip-text text-transparent"
          initial={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
          whileInView={{ scale: 1, opacity: 1 }}
        >
          CESIZEN
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          className="text-2xl"
          initial={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true, amount: 0.3 }}
          whileInView={{ y: 0, opacity: 1 }}
        >
          Votre parcours vers le bien-être mental
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex justify-center gap-4"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
          whileInView={{ opacity: 1 }}
        >
          <Button size="lg" as="a" href="/exercices/respiration">Commencer 👉</Button>
          <Button size="lg" variant="bordered" as="a" href="/articles">
            Découvrir 👉
          </Button>
        </motion.div>

        {/* Feature animé */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-md px-5 py-2 rounded-full shadow-lg mx-auto"
            exit={{ opacity: 0, x: 30 }}
            initial={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-2xl">{features[current].emoji}</span>
            <span className="font-medium text-gray-800">
              {features[current].text}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.section>
  );
}