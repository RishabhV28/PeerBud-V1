import { SiGithub, SiLinkedin } from "react-icons/si";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold text-xl text-primary">
              Peerbud
            </Link>
            <span className="text-sm text-muted-foreground">
              © 2024 All rights reserved
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/RishabhV28"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <SiGithub className="h-6 w-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/rishabh-verma-9a4997262/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <SiLinkedin className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
