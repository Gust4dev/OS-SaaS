"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Settings2, Sparkles } from "lucide-react";

interface SetupLoadingScreenProps {
  onComplete: () => void;
  minDuration?: number; // Minimum time to show loading screen (ms)
}

export function SetupLoadingScreen({
  onComplete,
  minDuration = 2000,
}: SetupLoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);

  // Keep ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const targetProgress = Math.min((elapsed / minDuration) * 100, 100);

      setProgress(targetProgress);

      if (targetProgress >= 100 && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        clearInterval(interval);
        // Call callback after a small delay for animation
        setTimeout(() => {
          onCompleteRef.current();
        }, 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [minDuration]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
    >
      <div className="flex flex-col items-center gap-6 text-center px-4">
        {/* Animated Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <Settings2 className="h-16 w-16 text-primary" />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Configurando seu ambiente
          </h2>
          <p className="text-muted-foreground">
            Estamos preparando tudo para você...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>

        {/* Progress Text */}
        <p className="text-sm text-muted-foreground">
          {progress < 30 && "Carregando configurações..."}
          {progress >= 30 && progress < 60 && "Preparando dashboard..."}
          {progress >= 60 && progress < 90 && "Quase lá..."}
          {progress >= 90 && "Pronto!"}
        </p>
      </div>
    </motion.div>
  );
}
