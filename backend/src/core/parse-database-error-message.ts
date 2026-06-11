import { Prisma } from "../generated/prisma/client";


export function parseDatabaseErrorMessage(err: unknown, entity: string) {
  console.log(err)

  let message: string = "Ocorreu um erro desconhecido no banco de dados";

  if (err instanceof Error && "message" in err) {
    const match = err.message.match(/Message:\s*`([^`]*)`/);

    message = match && match.length ? match[1]! : err.message;

    message = message.replace(/^ERROR:\s*/, "");
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2023":
        message = `${entity} não existe`;
        break;

      case "P2002":
        message = `${entity} tem um campo único já cadastrado`;
        break;

      case "P2003":
        message = `Relacionamento inválido para ${entity.toLowerCase()}`;
        break;

      case "P2005":
        message = `Existe um campo de ${entity.toLowerCase()} com tipo inválido`;
        break;

      case "P2011":
        message = `Não foi possível inserir nulo em um campo de ${entity.toLowerCase()}`;
        break;

      case "P2012":
        message = `Um campo obrigatório de ${entity.toLowerCase()} não foi enviado`;
        break;

      case "P2016":
        message = `A conexão demorou demais`;
        break;

      case "P2025":
        message = `${entity} não encontrado para a operação`;
        break;

      default:
        break;
    }
  }

  return message;
}