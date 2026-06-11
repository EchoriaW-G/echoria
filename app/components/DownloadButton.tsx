"use client";

type Props = {
  messageId: string;
};

export default function DownloadButton({
  messageId,
}: Props) {
  const handleClick = async () => {
    const res = await fetch("/api/download-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageId,
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <button
      onClick={handleClick}
      className="
        bg-white
        text-black
        px-8
        py-3
        rounded-2xl
        font-medium
        hover:opacity-90
        transition
      "
    >
      Pobierz nagranie
    </button>
  );
}