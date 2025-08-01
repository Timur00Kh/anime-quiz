import { useToast } from "@chakra-ui/react";
import { useCallback } from "react";

export function useToastErr<T>() {
  const toast = useToast();

  return useCallback(
    (err: Error) =>
      toast({
        title: err.message,
        description: err.toString(),
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "bottom-right",
      }),
    [toast]
  );
}
