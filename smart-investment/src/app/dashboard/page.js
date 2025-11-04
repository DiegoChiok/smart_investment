"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase";
import Link from 'next/link';
import TiltedCard1 from '../portfolio_component/page';
import TiltedCard2 from '../insights_component/page';
import TiltedCard3 from '../watchlist_component/page';
import TiltedCard4 from '../settings_component/page';
import TextType from '../type_effect/page';
import { onAuthStateChanged } from "firebase/auth";


export default function DashboardPage() {
  const router = useRouter();

  //check auth state
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        //load portfolio if logged in
        if (currentUser) {
          loadPortfolio(currentUser.uid);
        } else {
          window.location.href = '/welcome';
          setLoading(false);
            //router.push('/welcome');
          window.location.href = '/welcome';
        }
      });
      return () => unsubscribe();
    }, [router]);

  return (
    <div className="relative min-h-screen flex flex-col bg-white font-serif font-bold">

        <div className="absolute inset-0 z-0">
            <video
            autoPlay
            loop
            muted
            playsInline
            className="object-cover w-full h-full"
            >
            <source src="/homeback.mp4" type="video/mp4" />
            Your browser does not support the video tag.
            </video>
        </div>

        <div className="relative z-20">

            <div className="flex flex-col items-center justify-center text-6xl font-bold pt-5 text-black">
                <h1 className="pb-10 pt-10 bg-white border rounded-4xl border-white font-serif px-3">StockUp</h1>
                <TextType 
                text={["Welcome to StockUp", "For your stock market queries", "Explore, Invest, Earn!"]}
                typingSpeed={75}
                pauseDuration={1500}
                showCursor={true}
                cursorCharacter="|"
                className="pt-10"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-10 pl-10">

                <div className="text-black flex items-center justify-center opacity-80 hover:opacity-100">
                    <TiltedCard1
                imageSrc="/folder-kanban.svg"
                altText="Portfolio"
                captionText="Portfolio"
                containerHeight="300px"
                containerWidth="300px"
                imageHeight="300px"
                imageWidth="300px"
                rotateAmplitude={12}
                scaleOnHover={1.2}
                showMobileWarning={false}
                showTooltip={true}
                displayOverlayContent={true}
                overlayContent={
                    <p className="tilted-card-demo-text text-3xl flex items-center justify-center pl-23 pt-70">
                    Portfolio
                    </p>
                }
                />
                </div>
                <div className="text-black flex items-center justify-center opacity-80 hover:opacity-100">
                    <TiltedCard2
                imageSrc="/chart-area.svg"
                altText="Insights"
                captionText="Insights"
                containerHeight="300px"
                containerWidth="300px"
                imageHeight="300px"
                imageWidth="300px"
                rotateAmplitude={12}
                scaleOnHover={1.2}
                showMobileWarning={false}
                showTooltip={true}
                displayOverlayContent={true}
                overlayContent={
                    <p className="tilted-card-demo-text text-3xl flex items-center justify-center pl-23 pt-70">
                    Insights
                    </p>
                }
                />
                </div>
                <div className="text-black flex items-center justify-center opacity-80 hover:opacity-100">
                    <TiltedCard3
                imageSrc="/binoculars.svg"
                altText="Watchlist"
                captionText="Watchlist"
                containerHeight="300px"
                containerWidth="300px"
                imageHeight="300px"
                imageWidth="300px"
                rotateAmplitude={12}
                scaleOnHover={1.2}
                showMobileWarning={false}
                showTooltip={true}
                displayOverlayContent={true}
                overlayContent={
                    <p className="tilted-card-demo-text text-3xl flex items-center justify-center pl-20 pt-70">
                    Watchlist
                    </p>
                }
                />
                </div>
                <div className="text-black flex items-center justify-center opacity-80 hover:opacity-100">
                    <TiltedCard4
                imageSrc="/settings.svg"
                altText="Settings"
                captionText="Settings"
                containerHeight="300px"
                containerWidth="300px"
                imageHeight="300px"
                imageWidth="300px"
                rotateAmplitude={12}
                scaleOnHover={1.2}
                showMobileWarning={false}
                showTooltip={true}
                displayOverlayContent={true}
                overlayContent={
                    <p className="tilted-card-demo-text text-3xl flex items-center justify-center pl-21 pt-70">
                    Settings
                    </p>
                }
                />
                </div>

            </div>

        </div>

    </div>
  );
}
