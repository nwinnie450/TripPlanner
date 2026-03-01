import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface MyTrip {
  passcode: string;
  tripName: string;
  startDate: string;
  endDate: string;
  currency: string;
  memberCount: number;
}

interface MyTripsResponse {
  trips: MyTrip[];
}

export function useMyTrips(enabled: boolean = true) {
  const { data, error, isLoading, mutate } = useSWR<MyTripsResponse>(
    enabled ? "/api/trips/mine" : null,
    fetcher,
    { revalidateOnFocus: true },
  );

  return { trips: data?.trips ?? [], isLoading, error, mutate };
}
