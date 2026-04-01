import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigator } from "./src/navigation/AppNavigator";
import "./src/i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function App() {

  useEffect(() => {
    const url1 = 'https://www.olx.com.lb/api/files/33129224';
    const url2 = 'https://www.olx.com.lb/api/files/21698aa7-07d5-414d-8759-478d40ee5b13-68a7a97b-96ac-48';

    [url1, url2].forEach(url => {
      fetch(url)
        .then(r => {
          console.log(
            `URL: ${url.slice(-20)} STATUS: ${r.status} TYPE: ${r.headers.get('content-type')}`
          );
        })
        .catch(e => console.log('ERROR:', e.message));
    });
  }, []);

  // second test
  useEffect(() => {
    const testUrl =
      "https://apollo-ireland.akamaized.net/v1/files/21698aa7-07d5-414d-8759-478d40ee5b13-68a7a97b-96ac-48/image;s=761x1000";

    fetch(testUrl)
      .then((r) => {
        console.log("IMAGE TEST STATUS:", r.status);
        console.log(
          "IMAGE TEST HEADERS:",
          JSON.stringify(Object.fromEntries(r.headers.entries()))
        );
      })
      .catch((e) => console.log("IMAGE TEST ERROR:", e.message));
  }, []);

  

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);
export default App;