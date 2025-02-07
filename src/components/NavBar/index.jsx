import FPL_LOGO from "public/images/fpl-logo.png";
import GITHUB_LOGO from "public/images/github-logo.png";
import DropDownBar from "./DropDownBar";

const Navbar = () => {
  return (
    <nav className="absolute top-0 left-0 flex h-20 w-screen justify-around border-b border-b-gray-600 bg-amber-500">
      <div className="flex items-center gap-2">
        <Icon icon={FPL_LOGO} size={40} />
        <h1 className="text-md">Premier League Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <h1 href="https://github.com/Marc-Chiu/Prem-Dashboard" className="text-md hover:underline">
          Source Code
        </h1>
        <Icon icon={GITHUB_LOGO} size={20} />
        <DropDownBar />
      </div>
    </nav>
  );
};

const Icon = ({ icon, size }) => {
  return (
    <div className="">
      <img src={icon} alt="Icon" style={{ width: `${size}px`, height: `${size}px` }} />
    </div>
  );
};

export default Navbar;
