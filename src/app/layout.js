// This file is a Server Component by default.
// We import our client-side ResizeWrapper component.
import './globals.css';
import ResizeWrapper from '../components/ResizeWrapper';

export const metadata = {
  title: 'My App',
  description: 'A description of my app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        <ResizeWrapper>
          {/* 
            If your resize helper expects an element with id "root",
            wrap the children in a div with that id.
          */}
          <div id="root" className="w-full p-0">
            {children}
          </div>
        </ResizeWrapper>
      </body>
    </html>
  );
}
