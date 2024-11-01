import localFont from "next/font/local";
import "./globals.css";
import "primereact/resources/themes/lara-light-purple/theme.css";
import { Box, Flex } from "@chakra-ui/react";
import { PrimeReactProvider } from 'primereact/api';

import { Providers } from './providers'
import { fonts } from './fonts'

import { metadata } from "./metadata";
import Sidebar from "./components/sidebar/Sidebar";



const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


export default function RootLayout({ children }) {
  
  return (
    <html lang="es-MX">
      <head>
        <title>{metadata.title.default}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <PrimeReactProvider>
            <Flex h={"100vh"} w={"100vw"} flexDir={"row"}>
              <Sidebar />
              <Flex 
                  flexDir={"column"} 
                  w={"100%"} 
                  h={"100vh"} 
                  overflow={"auto"} 
                  justifyContent={"center"} 
                  flexGrow={1} 
                >
                
                {children}
              </Flex>
            </Flex>   
          </PrimeReactProvider>     
        </Providers>
      </body>
    </html>
  );
}
