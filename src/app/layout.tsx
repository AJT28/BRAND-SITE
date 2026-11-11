import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'YOUR BRAND | Colorful Ethnic Wear',description:'Explore vibrant ethnic wear and inquire directly about your favorite styles.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
