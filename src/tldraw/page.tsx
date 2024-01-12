// import { CONNECTION_STRING } from '@/lib/config'
import Tldraw from "./Tldraw";
import { YDocProvider } from "@y-sweet/react";
import { getOrCreateDocAndToken } from "@y-sweet/sdk";

const CONNECTION_STRING =
    "yss://BomJgXzxdIyahuBs9gw.AAAgUiPU_AH_aPA563f2M9u5g2QvPHxcoK7N4fiuMSJQmzY@y-sweet.net/p/jEBt2X2fx3Yza4mLvY4/";

type HomeProps = {
    searchParams: Record<string, string>;
};

export default async function Home({ searchParams }: HomeProps) {
    const clientToken = await getOrCreateDocAndToken(
        CONNECTION_STRING,
        searchParams.doc
    );

    return (
        <YDocProvider clientToken={clientToken} setQueryParam="doc">
            <Tldraw />
        </YDocProvider>
    );
}
