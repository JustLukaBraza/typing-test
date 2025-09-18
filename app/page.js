import fs from 'fs';
import path from 'path';

export default function Home() {
  // This is a simple Next.js page that will serve your Vite-built files
  return (
    <div>
      <h1>Loading...</h1>
      <script dangerouslySetInnerHTML={{
        __html: `
          // Redirect to the Vite-built index.html
          window.location.href = '/index.html';
        `
      }} />
    </div>
  );
}
