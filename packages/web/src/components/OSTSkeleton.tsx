"use client";

import {
  Box,
  Card,
  CardBody,
  Flex,
  Skeleton,
  Stack,
} from "@chakra-ui/react";

export function OSTSkeleton() {
  return (
    <Card>
      <CardBody>
        <Stack spacing={4}>
          <Box>
            <Skeleton height="24px" width="200px" mb={2} />
            <Flex align="center" gap={2}>
              <Skeleton height="20px" width="100px" />
              <Skeleton height="20px" width="60px" />
            </Flex>
          </Box>
          <Box>
            <Skeleton height="20px" width="80px" mb={2} />
            <Stack>
              <Flex p={2} borderRadius="md" justify="space-between" align="center">
                <Skeleton height="20px" width="150px" />
                <Skeleton height="20px" width="80px" />
              </Flex>
            </Stack>
          </Box>
          <Box>
            <Skeleton height="20px" width="120px" mb={2} />
            <Skeleton height="200px" borderRadius="8px" />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  );
}

export function OSTSkeletonList() {
  return (
    <Stack spacing={4} mt={6}>
      <OSTSkeleton />
      <OSTSkeleton />
    </Stack>
  );
} 