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
  HStack,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { useAuth } from "@/utils/useAuth";
import NextLink from "next/link";
import { useLanguage } from "@/utils/useLanguage";

const translations = {
  en: {
    search: "Search",
    quiz: "Quiz",
    ostQuiz: "OST Quiz",
    login: "Login with Shikimori",
    profile: "Profile",
    logout: "Logout",
  },
  ru: {
    search: "Поиск",
    quiz: "Викторина",
    ostQuiz: "OST Викторина",
    login: "Войти через Shikimori",
    profile: "Профиль",
    logout: "Выйти",
  },
};

export function Header() {
  const { user, login, logout } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const t = translations[language];
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box 
      as="header" 
      bg={bgColor} 
      boxShadow="sm" 
      position="sticky" 
      top={0} 
      zIndex={1}
      borderBottom="1px"
      borderColor={borderColor}
    >
      <Flex
        maxW="1200px"
        mx="auto"
        px={4}
        py={3}
        align="center"
        justify="space-between"
      >
        <Flex align="center" gap={8}>
          <Link as={NextLink} href="/" _hover={{ textDecoration: "none" }}>
            <Text fontSize="xl" fontWeight="bold" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
              Anime Quiz
            </Text>
          </Link>

          <HStack spacing={6}>
            <Link as={NextLink} href="/search" _hover={{ color: "blue.500" }} fontWeight="medium">
              {t.search}
            </Link>
            <Link as={NextLink} href="/quiz" _hover={{ color: "blue.500" }} fontWeight="medium">
              {t.quiz}
            </Link>
            <Link as={NextLink} href="/ost-quiz" _hover={{ color: "blue.500" }} fontWeight="medium">
              {t.ostQuiz}
            </Link>
          </HStack>
        </Flex>

        <HStack spacing={4}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => changeLanguage(language === 'en' ? 'ru' : 'en')}
            fontWeight="bold"
          >
            {language === 'en' ? 'RU' : 'EN'}
          </Button>

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
                  {t.profile}
                </MenuItem>
                <MenuItem onClick={logout}>
                  {t.logout}
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button 
              colorScheme="blue"
              onClick={login}
              size="sm"
              fontWeight="medium"
            >
              {t.login}
            </Button>
          )}
        </HStack>
      </Flex>
    </Box>
  );
} 