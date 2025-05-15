import Image from "next/image";
import dottedface from "@/media/dottedface.gif";
import graceface from "@/media/grace.png";

export default function DottedFace(props: any) {
  return (
    <div className="flex justify-center items-center border border-white/20 rounded-2xl p-4 backdrop-blur-md transition-all duration-300 ease-in-out hover:scale-105 hover: shadow-2xl">
      <Image src={graceface} alt="loading..." width={320} height={320} />
    </div>
  );
}
