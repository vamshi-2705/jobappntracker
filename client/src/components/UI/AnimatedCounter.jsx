import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const AnimatedCounter = ({ value = 0, duration = 1.2 }) => {
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [text, setText] = useState('0');

  useEffect(() => {
    spring.set(Number(value) || 0);
  }, [value, spring]);

  useEffect(() => {
    const unsub = display.on('change', (v) => setText(String(v)));
    return () => unsub();
  }, [display]);

  return <motion.span>{text}</motion.span>;
};

export default AnimatedCounter;
