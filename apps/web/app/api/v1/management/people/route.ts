import { authenticateRequest } from "@/app/api/v1/auth";
import { responses } from "@/app/lib/api/response";
import { getPeople } from "@fastform/lib/person/service";
import { DatabaseError } from "@fastform/types/errors";
import { TPerson } from "@fastform/types/people";

export async function GET(request: Request) {
  try {
    const authentication = await authenticateRequest(request);
    if (!authentication) return responses.notAuthenticatedResponse();
    const people: TPerson[] = await getPeople(authentication.environmentId!);
    return responses.successResponse(people);
  } catch (error) {
    if (error instanceof DatabaseError) {
      return responses.badRequestResponse(error.message);
    }
    throw error;
  }
}

// Please use the client API to create a new person

/* export async function POST(request: Request): Promise<NextResponse> {
  try {
    const authentication = await authenticateRequest(request);
    if (!authentication) return responses.notAuthenticatedResponse();
    const person: TPerson = await createPerson(authentication.environmentId);
    return responses.successResponse(person);
  } catch (error) {
    if (error instanceof DatabaseError) {
      return responses.badRequestResponse(error.message);
    }
    throw error;
  }
} */
