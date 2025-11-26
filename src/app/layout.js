// This file is a Server Component by default.
// We import our client-side ResizeWrapper component.
import './globals.css';
import ResizeWrapper from '../components/ResizeWrapper';

export const metadata = {
  title: 'Custom interactive',
  description: 'This is bespoke interactive component.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        <ResizeWrapper>
          {/*
            ResizeWrapper automatically works with both Insendi and Canvas LMS.
            No configuration needed!
          */}
          <div id="root" className="w-full p-0">
            {children}
          </div>
        </ResizeWrapper>
      </body>
    </html>
  );
}
