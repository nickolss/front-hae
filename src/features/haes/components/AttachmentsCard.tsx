import { useRef } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import ImageOutlined from "@mui/icons-material/ImageOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutlineOutlined";
import { formatDateTime, formatFileSize } from "@/shared/lib/format";
import type { Attachment } from "../types";

const ACCEPT = "application/pdf,image/png,image/jpeg";
const MAX = 5 * 1024 * 1024;

interface Props {
  attachments: Attachment[];
  canManage: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
  onRemove: (attachment: Attachment) => void;
  onInvalid: (message: string) => void;
}

export function AttachmentsCard({ attachments, canManage, uploading, onUpload, onRemove, onInvalid }: Props) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardContent>
        <Typography variant="h2" sx={{ mb: 1 }}>
          Comprovantes
        </Typography>
        {attachments.length === 0 ? (
          <Typography color="text.secondary">Nenhum comprovante anexado.</Typography>
        ) : (
          <List dense>
            {attachments.map((a) => (
              <ListItem
                key={a.id}
                secondaryAction={
                  canManage && (
                    <IconButton edge="end" aria-label={`Remover ${a.fileName}`} onClick={() => onRemove(a)}>
                      <DeleteOutline />
                    </IconButton>
                  )
                }
              >
                <ListItemIcon>
                  {a.contentType.startsWith("image/") ? <ImageOutlined /> : <DescriptionOutlined />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Link href={a.url} target="_blank" rel="noopener noreferrer">
                      {a.fileName} <span className="sr-only">(abre em nova aba)</span>
                    </Link>
                  }
                  secondary={`${formatFileSize(a.sizeBytes)} · ${formatDateTime(a.uploadedAt)}`}
                />
              </ListItem>
            ))}
          </List>
        )}
        {canManage && (
          <>
            <Alert severity="info" sx={{ my: 1.5 }}>
              PDF, PNG ou JPG de até 5 MB. Máximo de 10 arquivos.
            </Alert>
            <input
              ref={input}
              type="file"
              accept={ACCEPT}
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                if (file.size > MAX) return onInvalid("O arquivo deve ter no máximo 5 MB.");
                if (!ACCEPT.split(",").includes(file.type))
                  return onInvalid("Envie um arquivo PDF, PNG ou JPG.");
                onUpload(file);
              }}
            />
            <Button
              variant="outlined"
              startIcon={<UploadFileOutlined />}
              loading={uploading}
              onClick={() => input.current?.click()}
              disabled={attachments.length >= 10}
            >
              Anexar comprovante
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
