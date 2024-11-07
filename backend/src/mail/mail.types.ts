import { ReactElement } from "react";

export interface MailData {
  to: string;
  subject: string;
  template: ReactElement;
}
