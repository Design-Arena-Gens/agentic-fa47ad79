import './globals.css';
export const metadata = {
  title: "Viral Shorts Agent",
  description: "Generate viral YouTube Shorts hooks, scripts, and hashtags"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        background: 'linear-gradient(180deg,#0b1020 0%,#0b0f1a 100%)',
        color: '#e9ecf1',
        minHeight: '100vh'
      }}>
        {children}
      </body>
    </html>
  );
}
