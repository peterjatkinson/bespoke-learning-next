// This file is a Server Component by default.
// We import our client-side ResizeWrapper component.
import './globals.css';
import ResizeWrapper from '../components/ResizeWrapper';
import { LMSConfigProvider } from '../components/LMSConfig';

export const metadata = {
  title: 'Custom interactive',
  description: 'This is bespoke interactive component.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        <LMSConfigProvider>
          <ResizeWrapper>
            {/*
              If your resize helper expects an element with id "root",
              wrap the children in a div with that id.

              By default, all apps use Insendi LMS.
              To use Canvas LMS, add this line at the top of your page component:
              <LMSConfig lmsType="canvas" />
            */}
            <div id="root" className="w-full p-0">
              {children}
            </div>
          </ResizeWrapper>
        </LMSConfigProvider>
      </body>
    </html>
  );
}
