import { IoMdArrowDropdown } from "react-icons/io";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import NavBar from "./nav/NavBar";
import NavDropdown from "./nav/NavDropdown";
import NavItem from "./nav/NavItem";
import { decodeToken } from "../utils/auth";

const PopulatedNavBar: React.FC = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const token = document.cookie
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("speed_token="))
      ?.split("=")[1] || null;
    setRole(decodeToken(token)?.role || null);
  }, []);

  // Hide nav items on auth pages (login/register)
  const isAuthPage = router.pathname?.startsWith('/auth') ?? false;
  const isReviewer = role === 'moderator' || role === 'admin';
  const isAnalyst = role === 'analyst';

  // Only render nav items after we've determined the role on the client
  // This ensures server and client render the same initial HTML (empty nav)
  // and then the client adds items once we know the role
  if (!isClient) {
    return (
      <NavBar>
        <NavItem>SPEED</NavItem>
      </NavBar>
    );
  }

  return (
    <NavBar>
      <NavItem>SPEED</NavItem>
      {!isAuthPage && role === 'submitter' && (
        <NavItem onClick={() => router.push('/my-moderation')} end>
          Home
        </NavItem>
      )}

      {!isAuthPage && role === 'submitter' && (
        <NavItem dropdown route="/articles">
          Articles <IoMdArrowDropdown />
          <NavDropdown>
            <NavItem route="/articles">View articles</NavItem>
            <NavItem route="/articles/new">Submit new</NavItem>
          </NavDropdown>
        </NavItem>
      )}
      
      {!isAuthPage && isReviewer && (
        role === 'admin' ? (
          <NavItem route="/admin" end>Admin</NavItem>
        ) : (
          <NavItem route="/moderator" end>Moderator</NavItem>
        )
      )}

      {!isAuthPage && isAnalyst && (
        <NavItem route="/analyst" end>Analyst</NavItem>
      )}
    </NavBar>
  );
};

export default PopulatedNavBar;