import * as React from "react";
import { cn } from "@/lib/utils";

export interface SocialLink {
  icon: React.ElementType;
  href: string;
}

export interface TeamMember {
  name: string;
  designation: string;
  imageSrc: string;
  socialLinks?: SocialLink[];
}

export interface TeamSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  members: TeamMember[];
  registerLink?: string;
  logo?: React.ReactNode;
  socialLinksMain?: SocialLink[];
}

export const TeamSection = React.forwardRef<HTMLDivElement, TeamSectionProps>(
  (
    {
      title,
      description,
      members,
      registerLink,
      logo,
      socialLinksMain,
      className,
      ...props
    },
    ref
  ) => {
    const isTwoMembers = members.length === 2;

    return (
      <section
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden bg-background pt-4 md:pt-6 lg:pt-8 pb-12 md:pb-16",
          className
        )}
        {...props}
      >
        <div className="container relative z-10 mx-auto grid items-center justify-center gap-6 px-4 text-center md:px-6">
          <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
            <svg className="h-full w-full" fill="none">
              <defs>
                <pattern
                  id="team-grid"
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M20 0L0 0 0 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-muted-foreground"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#team-grid)" />
            </svg>
          </div>

          <div className="relative z-10 flex w-full flex-col items-center justify-between gap-4 md:flex-row md:items-start md:text-left lg:gap-8">
            <div className="grid gap-2 text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-muted-foreground">
                <span className="text-primary block text-lg sm:text-xl md:text-2xl font-medium tracking-widest">
                  O U R
                </span>
                {title}
              </h2>
              <p className="max-w-[700px] text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
                {description}
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 md:items-end">
              {logo && <div className="text-2xl font-bold text-primary">{logo}</div>}
              {registerLink && (
                <a
                  href={registerLink}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  ร่วมสร้างสวนกับเรา
                </a>
              )}
            </div>
          </div>

          {socialLinksMain && socialLinksMain.length > 0 && (
            <div className="relative z-10 flex w-full items-center justify-center gap-4 py-2">
              {socialLinksMain.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
              <span className="text-muted-foreground text-xs sm:text-sm font-medium">
                www.plookploen.app
              </span>
            </div>
          )}

          <div
            className={cn(
              "relative z-10 mx-auto grid w-full gap-8 lg:gap-12",
              isTwoMembers
                ? "max-w-3xl grid-cols-1 md:grid-cols-2"
                : "max-w-5xl grid-cols-1 md:grid-cols-3"
            )}
          >
            {members.map((member, index) => (
              <div
                key={index}
                className="group relative flex flex-col items-center justify-end overflow-hidden rounded-2xl bg-card p-8 text-center shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl border border-border/50"
                style={{
                  backgroundColor:
                    index === 0
                      ? "hsl(var(--primary) / 0.06)"
                      : index === 1
                      ? "hsl(var(--muted) / 0.7)"
                      : "hsl(var(--warning) / 0.15)",
                  color: "hsl(var(--foreground))",
                }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 h-1/2 origin-bottom scale-y-0 transform rounded-t-full bg-gradient-to-t from-primary/20 to-transparent transition-transform duration-500 ease-out group-hover:scale-y-100"
                  style={{ transitionDelay: `${index * 50}ms` }}
                />

                <div
                  className="relative z-10 h-40 w-40 overflow-hidden rounded-full border-4 border-transparent bg-background/40 transition-all duration-500 ease-out group-hover:border-primary group-hover:scale-105 shadow-md"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <img
                    src={member.imageSrc}
                    alt={member.name}
                    className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                </div>

                <h3 className="relative z-10 mt-5 text-xl sm:text-2xl font-bold text-foreground">
                  {member.name}
                </h3>
                <p className="relative z-10 mt-1 text-sm sm:text-base font-medium text-muted-foreground">
                  {member.designation}
                </p>

                {member.socialLinks && member.socialLinks.length > 0 && (
                  <div className="relative z-10 mt-4 flex gap-3 opacity-80 sm:opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
                    {member.socialLinks.map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-full hover:bg-primary/15"
                      >
                        <link.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
);

TeamSection.displayName = "TeamSection";
