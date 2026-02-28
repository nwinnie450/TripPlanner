interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return <p className="py-2 text-[13px] text-red">{message}</p>;
}
