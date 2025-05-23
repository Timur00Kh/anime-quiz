"use client";

import {
  Box,
  Button,
  Flex,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Link,
} from "@chakra-ui/react";
import { useAuth } from "@/utils/useAuth";

export function Header() {
  const { user, login, logout } = useAuth();

  return (
    <Box as="header" bg="white" boxShadow="sm" position="sticky" top={0} zIndex={1}>
      <Flex
        maxW="1200px"
        mx="auto"
        px={4}
        py={2}
        align="center"
        justify="space-between"
      >
        <Link href="/" _hover={{ textDecoration: "none" }}>
          <Text fontSize="xl" fontWeight="bold">
            Anime Quiz
          </Text>
        </Link>

        <Box>
          {user ? (
            <Menu>
              <MenuButton>
                <Avatar
                  size="sm"
                  name={user.nickname}
                  src={user.avatar}
                />
              </MenuButton>
              <MenuList>
                <MenuItem as={Link} href="/profile">
                  Profile
                </MenuItem>
                <MenuItem onClick={logout}>
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button colorScheme="blue" onClick={login}>
              Login with Shikimori
            </Button>
          )}
        </Box>
      </Flex>
    </Box>
  );
} 