"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, ButtonGroup, Card, CardBody, Heading, Stack } from "@chakra-ui/react";
import { IExternalLink } from "@/utils/shikiAPI";
import { OSTCard } from "@/components/OSTCard";
import { OSTSkeletonList } from "@/components/OSTSkeleton";
import { useToastErr } from "@/utils/useToastErr";
import { api } from "@@convex/_generated/api";
import { useAction, useQuery, Preloaded, usePreloadedQuery } from "convex/react";

import { OstType } from "world-art-parser";
import { Osts } from "./models";

type FilterType = OstType | "ALL";



interface AnimePageClientProps {
    id: number;
    waId?: number;
    initialOsts: Preloaded<typeof api.worldArt.getAnimeOst>;
}

export default function AnimePageClient({ id, waId, initialOsts }: AnimePageClientProps): JSX.Element {
    const [selectedType, setSelectedType] = useState<FilterType>("ALL");
    const toastErr = useToastErr();
    const parseOsts = useAction(api.worldArt.parseOstsFromWorldArt);

    const osts = usePreloadedQuery(initialOsts);
    const isLoadingOsts = useMemo(() => Boolean(osts?.length), [osts]);


    useEffect(() => {
        if (waId && !isLoadingOsts) {
            parseOsts({ waId, shikimoriId: id }).catch(toastErr);
        }
    }, [waId, id, parseOsts, isLoadingOsts]);


    return (
        <>
            <Card mt={6}>
                <CardBody>
                    <Heading size="sm" mb={4}>Filter OSTs</Heading>
                    <ButtonGroup spacing={2} size="sm">
                        <Button
                            colorScheme={selectedType === "ALL" ? "blue" : "gray"}
                            onClick={() => setSelectedType("ALL")}
                        >
                            All
                        </Button>
                        <Button
                            colorScheme={selectedType === OstType.OP ? "blue" : "gray"}
                            onClick={() => setSelectedType(OstType.OP)}
                        >
                            Openings
                        </Button>
                        <Button
                            colorScheme={selectedType === OstType.ED ? "blue" : "gray"}
                            onClick={() => setSelectedType(OstType.ED)}
                        >
                            Endings
                        </Button>
                        <Button
                            colorScheme={selectedType === OstType.TRAILER ? "blue" : "gray"}
                            onClick={() => setSelectedType(OstType.TRAILER)}
                        >
                            Trailers
                        </Button>
                    </ButtonGroup>
                </CardBody>
            </Card>

            <Stack spacing={4} mt={4}>
                {!osts?.length ? (
                    <OSTSkeletonList />
                ) : (
                    osts
                        .filter((ost: Osts[number]) => selectedType === "ALL" || ost.type === selectedType)
                        .map((ost: Osts[number]) => (
                            <OSTCard key={ost.id} ost={ost} />
                        ))
                )}
            </Stack>
        </>
    );
} 