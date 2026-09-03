import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  BadgeCheck,
  ImagePlus,
  User,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────────── */

type SigFields = {
  name: string;
  title: string;
  company: string;
  email: string;
  website: string;
  phone: string;
};

type SocialLinks = {
  linkedin: string;
  instagram: string;
  twitter: string;
  facebook: string;
  youtube: string;
};

type SocialKey = keyof SocialLinks;

type PhotoAnimation = "none" | "glow" | "sweep" | "pulse" | "diagonal";

const PHOTO_ANIMATIONS: { id: PhotoAnimation; label: string }[] = [
  { id: "none", label: "None" },
  { id: "glow", label: "Glow" },
  { id: "sweep", label: "Sweep" },
  { id: "pulse", label: "Pulse" },
  { id: "diagonal", label: "Diagonal" },
];

const SOCIAL_META: { key: SocialKey; label: string; placeholder: string; icon: typeof Linkedin }[] = [
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/janedoe", icon: Linkedin },
  { key: "instagram", label: "Instagram", placeholder: "@janedoe", icon: Instagram },
  { key: "twitter", label: "Twitter / X", placeholder: "@janedoe", icon: Twitter },
  { key: "facebook", label: "Facebook", placeholder: "facebook.com/janedoe", icon: Facebook },
  { key: "youtube", label: "YouTube", placeholder: "youtube.com/@janedoe", icon: Youtube },
];

/* ── Helpers ────────────────────────────────────────────────── */

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHue(hex: string): number | null {
  const m = hex.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const r = parseInt(m[1].slice(0, 2), 16) / 255;
  const g = parseInt(m[1].slice(2, 4), 16) / 255;
  const b = parseInt(m[1].slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === min) return 0;
  let hue = 0;
  const d = max - min;
  if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) hue = ((b - r) / d + 2) * 60;
  else hue = ((r - g) / d + 4) * 60;
  return Math.round(hue);
}

function hslToGradient(hue: number): [string, string, string] {
  return [
    `hsl(${hue}, 60%, 8%)`,
    `hsl(${hue}, 55%, 22%)`,
    `hsl(${hue}, 50%, 35%)`,
  ];
}

/* ── CSS for photo animations ───────────────────────────────── */

const PHOTO_ANIM_STYLES = `
@keyframes sig-glow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}
@keyframes sig-sweep {
  0% { transform: translateX(-100%) rotate(18deg); }
  100% { transform: translateX(200%) rotate(18deg); }
}
@keyframes sig-pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.08); opacity: 1; }
}
@keyframes sig-diagonal {
  0% { background-position: -200% 200%; }
  100% { background-position: 200% -200%; }
}
`;

/* ── Color picker popover ───────────────────────────────────── */

const ColorPickerPanel = ({
  hue,
  onHueChange,
}: {
  hue: number;
  onHueChange: (h: number) => void;
}) => {
  const [hexInput, setHexInput] = useState(hslToHex(hue, 55, 35));

  useEffect(() => {
    setHexInput(hslToHex(hue, 55, 35));
  }, [hue]);

  const handleHexSubmit = () => {
    const h = hexToHue(hexInput);
    if (h !== null) onHueChange(h);
  };

  return (
    <div className="mt-3 glass rounded-xl border border-white/15 p-4 shadow-2xl">
      {/* Clickable hue bar */}
      <div
        className="w-full h-8 rounded-lg mb-3 cursor-pointer relative"
        style={{
          background: "linear-gradient(to right, hsl(0,70%,50%), hsl(60,70%,50%), hsl(120,70%,50%), hsl(180,70%,50%), hsl(240,70%,50%), hsl(300,70%,50%), hsl(360,70%,50%))",
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          onHueChange(Math.round((x / rect.width) * 360));
        }}
      >
        <div
          className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg pointer-events-none"
          style={{ left: `${(hue / 360) * 100}%`, transform: `translate(-50%, -50%)` }}
        />
      </div>

      {/* Hex input */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground/60 font-mono">HEX</span>
        <Input
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          onBlur={handleHexSubmit}
          onKeyDown={(e) => e.key === "Enter" && handleHexSubmit()}
          className="flex-1 h-7 text-xs font-mono glass !bg-white/[0.10] border-0 focus-visible:ring-1 focus-visible:ring-white/40"
          maxLength={7}
        />
        <div
          className="w-7 h-7 rounded-md border border-white/15 shrink-0"
          style={{ background: hslToHex(hue, 55, 35) }}
        />
      </div>
    </div>
  );
};

/* ── Image upload button ────────────────────────────────────── */

const ImageUploadField = ({
  label,
  imageUrl,
  onChange,
  icon: Icon,
  square,
}: {
  label: string;
  imageUrl: string | null;
  onChange: (url: string | null) => void;
  icon: typeof User;
  square?: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <Label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "mt-1 w-full rounded-xl border-2 border-dashed border-white/10 glass !bg-white/[0.06]",
          "flex items-center justify-center gap-3 transition-all",
          "hover:border-white/25 hover:bg-white/[0.10] cursor-pointer group",
          square ? "h-28 aspect-square" : "h-20"
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className={cn("object-cover", square ? "h-20 w-20 rounded-md" : "h-14 w-14 rounded-lg")}
          />
        ) : (
          <>
            <Icon className="w-5 h-5 text-muted-foreground/50 group-hover:text-muted-foreground/80 transition-colors" />
            <span className="text-xs text-muted-foreground/50 group-hover:text-muted-foreground/80 transition-colors">
              Click to upload
            </span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      {imageUrl && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-[10px] text-muted-foreground/50 hover:text-destructive transition-colors mt-1"
        >
          Remove
        </button>
      )}
    </div>
  );
};

/* ── Signature card preview ─────────────────────────────────── */

const SocialIconPreview = ({ children }: { children: React.ReactNode }) => (
  <div className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-muted-foreground/60 shrink-0">
    {children}
  </div>
);

const PhotoArt = ({
  colors,
  initials,
  photoUrl,
  animation,
}: {
  colors: [string, string, string];
  initials: string;
  photoUrl: string | null;
  animation: PhotoAnimation;
}) => (
  <div
    className="w-full h-full relative overflow-hidden"
    style={{ background: `linear-gradient(148deg, ${colors[0]}, ${colors[1]} 55%, ${colors[2]})` }}
  >
    {photoUrl ? (
      <img src={photoUrl} alt="" className="w-full h-full object-cover" />
    ) : (
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white/50 text-2xl font-bold tracking-[3px] font-serif">
          {initials}
        </span>
      </div>
    )}

    {/* Overlay animations */}
    {animation === "glow" && (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 40%, ${colors[2]}88 0%, transparent 60%)`,
          animation: "sig-glow 2.5s ease-in-out infinite",
        }}
      />
    )}
    {animation === "sweep" && (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ overflow: "hidden" }}
      >
        <div
          className="absolute -top-[50%] w-[40%] h-[200%] bg-white/[0.12]"
          style={{ animation: "sig-sweep 3s ease-in-out infinite" }}
        />
      </div>
    )}
    {animation === "pulse" && (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colors[2]}55 0%, transparent 70%)`,
          animation: "sig-pulse 2s ease-in-out infinite",
        }}
      />
    )}
    {animation === "diagonal" && (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`,
          backgroundSize: "200% 200%",
          animation: "sig-diagonal 3s linear infinite",
        }}
      />
    )}

    {/* Static decorative bars (when no photo) */}
    {!photoUrl && (
      <>
        <div
          className="absolute -top-[30%] left-[18%] w-[36%] h-[165%] bg-white/[0.08]"
          style={{ transform: "rotate(18deg)" }}
        />
        <div
          className="absolute -top-[30%] left-[50%] w-[22%] h-[165%] bg-white/[0.04]"
          style={{ transform: "rotate(18deg)" }}
        />
      </>
    )}
  </div>
);

const SigCardPreview = ({
  fields,
  socials,
  accentColor,
  photoUrl,
  logoUrl,
  animation,
}: {
  fields: SigFields;
  socials: SocialLinks;
  accentColor: number;
  photoUrl: string | null;
  logoUrl: string | null;
  animation: PhotoAnimation;
}) => {
  const initials = getInitials(fields.name || "JD");
  const colors = hslToGradient(accentColor);
  const activeSocials = SOCIAL_META.filter(({ key }) => socials[key].trim() !== "");

  return (
    <div className="flex h-full select-none">
      {/* Social sidebar */}
      {activeSocials.length > 0 && (
        <div className="w-8 bg-white/[0.03] border-r border-white/[0.06] flex flex-col items-center justify-center gap-1.5 py-1.5 shrink-0">
          {activeSocials.map(({ key, icon: Icon }) => (
            <SocialIconPreview key={key}>
              <Icon className="w-[9px] h-[9px]" />
            </SocialIconPreview>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 px-2.5 py-2 flex flex-col justify-center gap-0.5 min-w-0 overflow-hidden">
        {logoUrl && (
          <img src={logoUrl} alt="" className="h-4 w-auto object-contain object-left mb-1" />
        )}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[11.5px] text-foreground truncate">
            {fields.name || "Your Name"}
          </span>
          <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />
        </div>
        <div className="text-[10.5px] text-muted-foreground truncate">
          {fields.title || "Job Title"}
        </div>
        <div className="text-[9.5px] text-muted-foreground/70">
          {fields.company || "Company"}
        </div>
        <div className="text-[9.5px] text-muted-foreground/70 truncate">
          {fields.email || "email@company.com"}
        </div>
        {fields.phone && (
          <div className="text-[9.5px] text-muted-foreground/70">{fields.phone}</div>
        )}
        {fields.website && (
          <div className="text-[9.5px] text-muted-foreground/70">{fields.website}</div>
        )}
      </div>

      {/* Photo art — wider + squared */}
      <div className="w-[110px] shrink-0">
        <PhotoArt colors={colors} initials={initials} photoUrl={photoUrl} animation={animation} />
      </div>
    </div>
  );
};

/* ── Builder ────────────────────────────────────────────────── */

export const EmailSignatureBuilder = () => {
  const [fields, setFields] = useState<SigFields>({
    name: "Jane Doe",
    title: "Marketing Director",
    company: "Acme Inc.",
    email: "jane@acme.com",
    website: "www.acme.com",
    phone: "(555) 123-4567",
  });
  const [socials, setSocials] = useState<SocialLinks>({
    linkedin: "",
    instagram: "",
    twitter: "",
    facebook: "",
    youtube: "",
  });
  const [accentColor, setAccentColor] = useState(140);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [photoAnimation, setPhotoAnimation] = useState<PhotoAnimation>("glow");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const updateField = (key: keyof SigFields, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));
  const updateSocial = (key: SocialKey, value: string) =>
    setSocials((prev) => ({ ...prev, [key]: value }));

  const FIELD_META: { key: keyof SigFields; label: string; placeholder: string }[] = [
    { key: "name", label: "Full name", placeholder: "Jane Doe" },
    { key: "title", label: "Job title", placeholder: "Marketing Director" },
    { key: "company", label: "Company", placeholder: "Acme Inc." },
    { key: "email", label: "Email", placeholder: "jane@acme.com" },
    { key: "website", label: "Website", placeholder: "www.acme.com" },
    { key: "phone", label: "Phone", placeholder: "(555) 123-4567" },
  ];

  const colors = hslToGradient(accentColor);

  return (
    <div className="mt-8 md:mt-10">
      <style dangerouslySetInnerHTML={{ __html: PHOTO_ANIM_STYLES }} />

      <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-8 text-center lg:text-left">
        // Build your signature
      </p>

      {/* ── Full-width two-column builder ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 xl:gap-14">

        {/* ── Left: inputs ─────────────────────────────────── */}
        <div className="space-y-8">
          {/* Personal info group */}
          <fieldset className="space-y-3">
            <legend className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-2">
              Personal info
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FIELD_META.slice(0, 2).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <Label htmlFor={`sig-${key}`} className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                    {label}
                  </Label>
                  <Input
                    id={`sig-${key}`}
                    value={fields[key]}
                    onChange={(e) => updateField(key, e.target.value)}
                    placeholder={placeholder}
                    className="mt-1 text-sm glass !bg-white/[0.10] border-0 shadow-elev-2 hover:shadow-elev-3 focus-visible:shadow-elev-3 focus-visible:ring-2 focus-visible:ring-white/40 h-9 transition-all"
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FIELD_META.slice(2, 4).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <Label htmlFor={`sig-${key}`} className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                    {label}
                  </Label>
                  <Input
                    id={`sig-${key}`}
                    value={fields[key]}
                    onChange={(e) => updateField(key, e.target.value)}
                    placeholder={placeholder}
                    className="mt-1 text-sm glass !bg-white/[0.10] border-0 shadow-elev-2 hover:shadow-elev-3 focus-visible:shadow-elev-3 focus-visible:ring-2 focus-visible:ring-white/40 h-9 transition-all"
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FIELD_META.slice(4).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <Label htmlFor={`sig-${key}`} className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                    {label}
                  </Label>
                  <Input
                    id={`sig-${key}`}
                    value={fields[key]}
                    onChange={(e) => updateField(key, e.target.value)}
                    placeholder={placeholder}
                    className="mt-1 text-sm glass !bg-white/[0.10] border-0 shadow-elev-2 hover:shadow-elev-3 focus-visible:shadow-elev-3 focus-visible:ring-2 focus-visible:ring-white/40 h-9 transition-all"
                  />
                </div>
              ))}
            </div>
          </fieldset>

          {/* Images group */}
          <fieldset className="space-y-3">
            <legend className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-2">
              Images
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ImageUploadField
                label="Your photo"
                imageUrl={photoUrl}
                onChange={setPhotoUrl}
                icon={User}
                square
              />
              <ImageUploadField
                label="Company logo"
                imageUrl={logoUrl}
                onChange={setLogoUrl}
                icon={ImagePlus}
              />
            </div>
          </fieldset>

          {/* Photo animation selector */}
          <fieldset className="space-y-3">
            <legend className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-2">
              Photo overlay animation
            </legend>
            <div className="flex flex-wrap gap-2">
              {PHOTO_ANIMATIONS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPhotoAnimation(id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-mono transition-all border",
                    photoAnimation === id
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/20 hover:bg-white/[0.08]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Social links group */}
          <fieldset className="space-y-3">
            <legend className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-2">
              Social links <span className="text-muted-foreground/30">(optional)</span>
            </legend>
            {SOCIAL_META.map(({ key, label, placeholder, icon: Icon }) => (
              <div key={key} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-5" />
                <div className="flex-1">
                  <Label htmlFor={`sig-social-${key}`} className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                    {label}
                  </Label>
                  <Input
                    id={`sig-social-${key}`}
                    value={socials[key]}
                    onChange={(e) => updateSocial(key, e.target.value)}
                    placeholder={placeholder}
                    className="mt-1 text-sm glass !bg-white/[0.10] border-0 shadow-elev-2 hover:shadow-elev-3 focus-visible:shadow-elev-3 focus-visible:ring-2 focus-visible:ring-white/40 h-9 transition-all"
                  />
                </div>
              </div>
            ))}
          </fieldset>
        </div>

        {/* ── Right: live preview + color ──────────────────── */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          {/* "Signature Preview" heading */}
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 text-center">
            Signature preview
          </p>

          {/* Live preview */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-px rounded-2xl blur-md pointer-events-none transition-all duration-300"
              style={{
                background: `linear-gradient(90deg, ${colors[0]}, ${colors[2]})`,
                opacity: 0.5,
              }}
            />
            <div className="relative glass rounded-2xl border border-white/15 overflow-hidden">
              {/* Fake email header */}
              <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[11px] font-bold shrink-0 overflow-hidden">
                  {photoUrl ? (
                    <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(fields.name || "JD").charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-foreground truncate">
                    {fields.name || "Your Name"}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 truncate">
                    to: recipient@example.com
                  </p>
                </div>
              </div>

              {/* Fake email body */}
              <div className="px-4 pt-3 pb-2">
                <p className="text-[12px] text-foreground/70 mb-1.5">Hey there,</p>
                <div className="h-1.5 rounded bg-white/[0.06] w-[55%] mb-1" />
                <div className="h-1.5 rounded bg-white/[0.06] w-[72%] mb-3" />
                <p className="text-[12px] text-foreground/70 mb-2">Best,</p>
              </div>

              {/* Signature card */}
              <div className="mx-4 mb-4 rounded-xl border border-white/10 overflow-hidden h-[140px]">
                <SigCardPreview
                  fields={fields}
                  socials={socials}
                  accentColor={accentColor}
                  photoUrl={photoUrl}
                  logoUrl={logoUrl}
                  animation={photoAnimation}
                />
              </div>
            </div>
          </div>

          {/* Accent color — below preview */}
          <div>
            <Label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              Accent color
            </Label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={360}
                value={accentColor}
                onChange={(e) => setAccentColor(Number(e.target.value))}
                className="flex-1 h-3 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer"
                style={{
                  background: "linear-gradient(to right, hsl(0,70%,50%), hsl(60,70%,50%), hsl(120,70%,50%), hsl(180,70%,50%), hsl(240,70%,50%), hsl(300,70%,50%), hsl(360,70%,50%))",
                }}
              />
              <button
                type="button"
                onClick={() => setShowColorPicker((v) => !v)}
                className={cn(
                  "w-8 h-8 rounded-lg border-2 shrink-0 cursor-pointer transition-all hover:scale-110",
                  showColorPicker ? "border-primary" : "border-white/15 hover:border-white/30"
                )}
                style={{ background: `linear-gradient(148deg, ${colors[0]}, ${colors[1]} 55%, ${colors[2]})` }}
                title="Open color picker"
              />
            </div>
            {showColorPicker && (
              <ColorPickerPanel
                hue={accentColor}
                onHueChange={setAccentColor}
              />
            )}
          </div>

          <p className="text-[10px] text-muted-foreground/40 text-center">
            Live preview updates as you type
          </p>
        </div>
      </div>
    </div>
  );
};
