"use client";

import {
  Box,
  Card,
  CardBody,
  Stack,
  Heading,
  Text,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { OST } from "@/app/api/getOst/route";

interface OSTCardProps {
  ost: OST;
}

export function OSTCard({ ost }: OSTCardProps) {
  return (
    <Card key={ost.id}>
      <CardBody>
        <Stack spacing={4}>
          <Box>
            <Heading size="md" mb={2}>{ost.title}</Heading>
            <Flex align="center" gap={2}>
              <Text color="gray.600">{ost.unparsed_type}</Text>
              <Badge
                colorScheme="blue"
                px={2}
                py={1}
                borderRadius="md"
              >
                {ost.type}
              </Badge>
            </Flex>
          </Box>
          
          {ost.authors?.length > 0 && (
            <Box>
              <Text fontWeight="medium" mb={2}>Authors:</Text>
              <Stack>
                {ost.authors.map((author) => (
                  <Flex 
                    key={author.id}
                    p={2}
                    bg="gray.50"
                    borderRadius="md"
                    justify="space-between"
                    align="center"
                  >
                    <Text>{author.name}</Text>
                    <Badge colorScheme="purple">{author.role}</Badge>
                  </Flex>
                ))}
              </Stack>
            </Box>
          )}

          <Box>
            <Text fontWeight="medium" mb={2}>OST Preview:</Text>
            <video 
              controls 
              src={"http://www.world-art.ru/" + ost.video}
              style={{ width: '100%', borderRadius: '8px' }}
            />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  );
} 