import { useRouter } from 'next/router';
import styles from '../styles/globals.css'
import SidebarRespo from "@/components/SidebarRespo";

export default function MyApp({ Component, pageProps }) {
    const router = useRouter();
    return (
        <div className={router.pathname.includes('Admin') && "flex"}>
            {router.pathname.includes('Admin') && <SidebarRespo />}
            <Component {...pageProps} />
        </div>
    )
}
