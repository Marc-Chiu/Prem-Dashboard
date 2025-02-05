import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function DropDownBar() {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-2xl bg-white px-3 py-2 text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50">
          Tools and Frameworks
          <ChevronDownIcon
            aria-hidden="true"
            className="-mr-1 size-5 text-gray-400"
          />
        </MenuButton>
      </div>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-120 origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5"
      >
        <div className="grid grid-cols-2 py-1">
          <MenuItem>
            <div className="block px-4 py-2 text-sm text-gray-700">
              <a href="https://react.dev">
                <h1 className="text-[20px] hover:underline">React</h1>
              </a>
              <p className="text-[10px]">
                {" "}
                A popular JavaScript library for building dynamic user
                interfaces. It allows you to create reusable components that
                update efficiently in response to data changes, making it ideal
                for scalable applications.
              </p>
            </div>
          </MenuItem>
          <MenuItem>
            <div className="block px-4 py-2 text-sm text-gray-700">
              <a href="https://tailwindcss.com/blog/tailwindcss-v4">
                <h1 className="text-[20px] hover:underline">TailWindCSS</h1>
              </a>
              <p className="text-[10px]">
                {" "}
                A utility-first CSS framework that provides low-level utility
                classes for styling. It enables rapid UI development by letting
                you combine small, reusable classes directly in your HTML
                without writing a custom stylesheet for every element.
              </p>
            </div>
          </MenuItem>
          <MenuItem>
            <div className="block px-4 py-2 text-sm text-gray-700">
              <a href="https://d3-graph-gallery.com">
                <h1 className="text-[20px] hover:underline">D3</h1>
              </a>
              <p className="text-[10px]">
                {" "}
                A powerful JavaScript library for creating interactive data
                visualizations on the web. It manipulates the Document Object
                Model (DOM) based on data, giving you fine-grained control to
                craft sophisticated charts and graphics.
              </p>
            </div>
          </MenuItem>
          <MenuItem>
            <div className="block px-4 py-2 text-sm text-gray-700">
              <a href="https://observablehq.com/framework/">
                <h1 className="text-[20px] hover:underline">
                  Observable Framework
                </h1>
              </a>
              <p className="text-[10px]">
                {" "}
                An open-source static-site generator for fast, beautiful data
                apps, dashboards, reports, and embedded analytics using any
                programming language
              </p>
            </div>
          </MenuItem>
          <MenuItem>
            <div className="block px-4 py-2 text-sm text-gray-700">
              <a href="https://vite.dev/guide/">
                <h1 className="text-[20px] hover:underline">Vite</h1>
              </a>
              <p className="text-[10px]">
                {" "}
                A utility-first CSS framework that provides low-level utility
                classes for styling. It enables rapid UI development by letting
                you combine small, reusable classes directly in your HTML
                without writing a custom stylesheet for every element.
              </p>
            </div>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}

export default DropDownBar;
