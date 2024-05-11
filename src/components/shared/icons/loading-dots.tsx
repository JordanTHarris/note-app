import styles from "./loading-dots.module.css";

const LoadingDots = ({ className }: { className?: string }) => {
  return (
    <span className={styles.loading}>
      <span className={className} />
      <span className={className} />
      <span className={className} />
    </span>
  );
};

export default LoadingDots;
