import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';

export default function Logo() {
  return (
    <div className={`${lusitana.className} flex flex-col justify-end items-center h-full w-full -mb-6 ml-4`}>
      <Image
        src="/fix.png"
        alt="PRacer Logo"
        width={220}  // Adjust based on your logo's dimensions
        height={100} // Adjust based on your logo's dimensions
        priority
        style={{maxWidth: '110%', height: 'auto'}}
      />
    </div>
  );
}