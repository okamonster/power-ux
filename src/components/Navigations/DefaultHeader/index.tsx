type Props = {
  title: string;
};

export const DefaultHeader = ({ title }: Props) => {
  return (
    <header>
      <p>{title}</p>
    </header>
  );
};
