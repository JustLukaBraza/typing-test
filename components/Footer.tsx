import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="absolute bottom-4 w-full text-center text-secondary text-sm flex flex-col items-center gap-2">
      <p>ტესტის თავიდან დასაწყებად დააჭირეთ <span className="text-primary bg-light-dark px-2 py-1 rounded-md">Tab</span>-ს</p>
      <p>
        შექმნილია <a href="https://github.com/justlukabraza" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">justlukabraza</a>-ს მიერ
      </p>
    </footer>
  );
};

export default Footer;