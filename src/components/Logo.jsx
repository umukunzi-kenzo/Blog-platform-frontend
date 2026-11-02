import { FiBookOpen } from "react-icons/fi";

// The Storlo logo: the open book and the name.
// It uses the color of the text around it, so it works in dark and light mode.
const Logo = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: { icon: "w-4 h-4 mr-1.5", text: "text-base" },
    md: { icon: "w-5 h-5 mr-2", text: "text-xl" },
    lg: { icon: "w-7 h-7 mr-3", text: "text-3xl" },
  };

  const { icon, text } = sizes[size] || sizes.md;

  return (
    <span className={`inline-flex items-center font-bold ${text} ${className}`}>
      <FiBookOpen className={icon} aria-hidden="true" />
      Storlo
    </span>
  );
};

export default Logo;