import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';

export default function MainLogo() {
  return (
    <div className={`${lusitana.className} flex flex-col justify-end items-center h-full w-full -mb-80 ml-4`}>
      <Image
        src="/main.png"
        alt="PRacer Logo"
        width={800}  // Adjust based on your logo's dimensions
        height={10} // Adjust based on your logo's dimensions
        priority
        style={{maxWidth: '110%', height: 'auto'}}
      />
    </div>
  );
}