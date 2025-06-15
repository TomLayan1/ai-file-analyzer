import Image from "next/image";
import DragDropUpload from "./DragDropUpload";

export default function Home() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <DragDropUpload />
    </div>
  );
}
