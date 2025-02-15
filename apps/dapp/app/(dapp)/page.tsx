import { Container } from "@chakra-ui/react";
import Header from "../../content/header";
import Main from "../../content/main";

export default function Page() {
  return (
    <Container height="100vh" display="flex" flexDirection="column">
      <Header />
      <Main />
    </Container>
  );
}
