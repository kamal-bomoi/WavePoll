"use client";

import {
  ActionIcon,
  Box,
  Button,
  CloseButton,
  Divider,
  Input,
  Paper,
  ScrollArea,
  Space,
  Stack,
  TextInput,
  Title
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { AbsoluteCenter } from "@/components/absolute-center";
import { api } from "@/lib/api";
import type { ApiError, CreatePollPayload, Poll } from "@/types";

export default function CreatePollPage() {
  // const [sd, setsd] = useState<Date | null>(null);
  const mutation = useMutation<Poll, ApiError, CreatePollPayload>({
    mutationFn: async (variables) =>
      (await api.post<Poll>("/polls", variables)).data
  });
  // todo v2: based on new features which we will add do we need more data?
  const form = useForm({
    initialValues: {
      title: "",
      options: ["", ""],
      expires_at: null as null | Date
    }
  });

  // useEffect(() => {
  //   setsd(new Date());
  // }, []);

  const fields = form.values.options.map((_option, index) => (
    <div
      key={`options.${index}`}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <TextInput
        style={{ flex: 0.97 }}
        {...form.getInputProps(`options.${index}`)}
        placeholder={`option #${index + 1}`}
        autoComplete="off"
      />

      <ActionIcon
        variant="filled"
        size="sm"
        color="red"
        radius="xl"
        onClick={() => {
          if (form.values.options.length === 2) return;

          form.removeListItem("options", index);
        }}
      >
        <IconMinus />
      </ActionIcon>
    </div>
  ));

  const onsubmit = form.onSubmit(() => {});

  // if (!sd) return null;

  return (
    <AbsoluteCenter>
      <ScrollArea
        style={{
          width: 500,
          height: 600
        }}
      >
        <Paper
          p="xl"
          shadow="sm"
          style={{
            position: "relative",
            backgroundColor: "#fff"
          }}
        >
          <Title c="indigo" order={3} ta="center">
            create poll
          </Title>

          <Divider color="gray" labelPosition="center" />
          <Space h="md" />

          <form onSubmit={onsubmit}>
            <Stack>
              <TextInput
                label="title"
                {...form.getInputProps("title")}
                required
              />

              <Box>
                <Input.Wrapper
                  label="options"
                  required
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <ActionIcon
                    variant="filled"
                    color="indigo"
                    radius="xl"
                    size="sm"
                    onClick={() => {
                      if (form.values.options.length === 5) return;

                      form.insertListItem("options", "");
                    }}
                  >
                    <IconPlus />
                  </ActionIcon>
                </Input.Wrapper>

                <Stack>{fields}</Stack>
              </Box>

              <DateTimePicker
                label="ends"
                placeholder="pick date"
                {...form.getInputProps("expires_at")}
                valueFormat="MMMM D, YYYY h:mm A"
                {...(form.values.expires_at && {
                  rightSection: (
                    <CloseButton
                      onClick={() => {
                        // if (form.values.expires_at)
                        //   form.setFieldValue("expires_at", null);
                      }}
                    />
                  )
                })}
                minDate={new Date()}
                maxDate={dayjs().add(7, "days").toDate()}
                onChange={() => {
                  // if (value) form.setFieldValue("expires_at", value);
                }}
              />

              <Button
                color="indigo"
                type="submit"
                disabled={
                  mutation.isPending ||
                  form.values.options.length < 2 ||
                  !form.values.title.trim() ||
                  form.values.options.some((option) => !option)
                }
                loading={mutation.isPending}
              >
                create
              </Button>
            </Stack>
          </form>
        </Paper>
      </ScrollArea>
    </AbsoluteCenter>
  );
}
