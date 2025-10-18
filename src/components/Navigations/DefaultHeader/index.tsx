import styles from "./style.module.css";

type Props = {
  title: string;
};

export const DefaultHeader = ({ title }: Props) => {
  return (
    <header className={styles.defaultHeader}>
      <p className={styles.title}>{title}</p>
    </header>
  );
};
